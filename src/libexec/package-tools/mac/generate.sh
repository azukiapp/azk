#! /bin/bash

set -x

if [[ -z ${MAC_REPO_URL} ]] || \
   [[ -z ${MAC_REPO_DIR} ]] || \
   [[ -z ${MAC_REPO_STAGE_BRANCH} ]] || \
   [[ -z ${MAC_FORMULA_DIR} ]] || \
   [[ -z ${MAC_FORMULA_FILE} ]] || \
   [[ -z ${MAC_BUCKET_URL}]]; then
  echo "Missing env varible. Please check:
  MAC_REPO_URL: ${MAC_REPO_URL}
  MAC_REPO_DIR: ${MAC_REPO_DIR}
  MAC_REPO_STAGE_BRANCH: ${MAC_REPO_STAGE_BRANCH}
  MAC_FORMULA_DIR: ${MAC_FORMULA_DIR}
  MAC_FORMULA_FILE: ${MAC_FORMULA_FILE}
  MAC_BUCKET_URL: ${MAC_BUCKET_URL}
  "
  exit 1
fi

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
  conflicts_with 'azukiapp/azk/azk', :because => 'installation of azk in path'
  "
fi

rm -Rf ${MAC_REPO_DIR}
git clone ${MAC_REPO_URL} ${MAC_REPO_DIR}
tee ${MAC_FORMULA_DIR}/${MAC_FORMULA_FILE} <<EOF
require "formula"

class ${CLASS_NAME} < Formula
  homepage "http://azk.io"
  url "http://${MAC_BUCKET_URL}/mac/azk_${VERSION}.tar.gz"
  version "${VERSION}"
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

(
  set -e
  cd ${MAC_REPO_DIR}
  git checkout ${MAC_REPO_STAGE_BRANCH}
  git add ${MAC_FORMULA_DIR}/${MAC_FORMULA_FILE}
  git commit -m "Bumping version to azk v${VERSION}."
)