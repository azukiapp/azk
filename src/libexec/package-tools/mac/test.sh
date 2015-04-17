#! /bin/bash

set -x

export VERSION=$( azk version | awk '{ print $2 }' )

BASE_DIR=$( pwd )
SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

cp /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb.orig

# TODO: Replace using sed instead of override the whole file
tee /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb <<EOF
require "formula"

class Azk < Formula
  homepage "http://azk.io"
  url "file://${BASE_DIR}/package/brew/azk_${VERSION}.tar.gz"
  sha256 "${SHA256}"

  depends_on :macos => :mountain_lion
  depends_on :arch => :x86_64

  def install
    prefix.install Dir['*']
    prefix.install Dir['.nvmrc']
    prefix.install Dir['.dependencies']
  end
end

EOF

brew unlink azk > /dev/null 2>&1
brew install azukiapp/azk/azk

# TODO: Clean Formula.rb using git
if [[ "$( azk version )" == "azk ${VERSION}" ]]; then
    mv /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb.orig /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb
    echo "azk ${VERSION} has been successfully installed."
else
    mv /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb.orig /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb
    echo "Failed to install azk ${VERSION}."
    exit 3
fi
