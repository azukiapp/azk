#! /bin/bash

if [[ ! -e Azkfile.js ]]; then
    echo "Run this script in the project root"
    exit 2
fi

set -x

export PATH=`pwd`/bin:$PATH
export VERSION=$( azk version | awk '{ print $2 }' )

SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

rm -Rf /usr/local/Library/Taps/azukiapp
git clone https://github.com/azukiapp/homebrew-azk /usr/local/Library/Taps/azukiapp/homebrew-azk
tee /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk.rb <<EOF
require "formula"

class Azk < Formula
  homepage "http://azk.io"
  url "http://repo.azukiapp.com/mac/azk_${VERSION}.tar.gz"
  sha256 "${SHA256}"

  depends_on :macos => :mountain_lion
  depends_on :arch => :x86_64

  def install
    prefix.install Dir['*']
    prefix.install Dir['.nvmrc']
  end
end

EOF

