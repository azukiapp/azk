#! /bin/bash

set -x

export VERSION=$( azk version | awk '{ print $2 }' )

SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
CLASS_NAME="Azk${RELEASE_CHANNEL^}"
if [[ -z $RELEASE_CHANNEL ]]; then
  CHANNEL_SUFFIX=
  CONFLICTS=
else
  CHANNEL_SUFFIX="-${RELEASE_CHANNEL}"
  CONFLICTS="
  conflicts_with 'azk', :because => 'installation of azk in path'
  "
fi
REPO_URL="repo${CHANNEL_SUFFIX}.azukiapp.com"

rm -Rf /usr/local/Library/Taps/azukiapp
git clone https://github.com/azukiapp/homebrew-azk /usr/local/Library/Taps/azukiapp/homebrew-azk
tee /usr/local/Library/Taps/azukiapp/homebrew-azk/Formula/azk${CHANNEL_SUFFIX}.rb <<EOF
require "formula"

class ${CLASS_NAME} < Formula
  homepage "http://azk.io"
  url "http://${REPO_URL}/mac/azk_${VERSION}.tar.gz"
  sha256 "${SHA256}"
  ${CONFLICTS}
  depends_on :macos => :mountain_lion
  depends_on :arch => :x86_64

  def install
    prefix.install Dir['*']
    prefix.install Dir['.nvmrc']
    prefix.install Dir['.dependencies']
  end
end

EOF

