#! /bin/bash

set -x

if [[ -z "${MAC_REPO_DIR}" ]]; then
  echo "Missing MAC_REPO_DIR env varible."
  exit 1
fi

if [[ -z "${MAC_REPO_STAGE_BRANCH}" ]]; then
  echo "Missing MAC_REPO_STAGE_BRANCH env varible."
  exit 2
fi

export VERSION=$( azk version | awk '{ print $2 }' )

SHA256=$(shasum -a 256 shasum -a 256 "package/brew/azk_${VERSION}.tar.gz" | awk '{print $1}')

RELEASE_CHANNEL=$( echo "${VERSION}" | sed s/[^\\-]*// | sed s/^\\-// | sed s/\\..*// )
CLASS_NAME="Azk${RELEASE_CHANNEL^}"
if [[ -z "${RELEASE_CHANNEL}" ]]; then
  CHANNEL_SUFFIX=
  CONFLICTS=
else
  CHANNEL_SUFFIX="-${RELEASE_CHANNEL}"
  CONFLICTS="
  conflicts_with 'azukiapp/azk/azk', :because => 'installation of azk in path'
  "
fi

MAC_REPO_URL="https://github.com/azukiapp/homebrew-azk"
MAC_FORMULA_DIR="${MAC_REPO_DIR}/Formula"
MAC_FORMULA_FILE="azk${CHANNEL_SUFFIX}.rb"
MAC_BUCKET_URL="repo-stage.azukiapp.com"

rm -Rf ${MAC_REPO_DIR}
(
  set -e
  git clone ${MAC_REPO_URL} ${MAC_REPO_DIR}
  cd ${MAC_REPO_DIR}
  git checkout ${MAC_REPO_STAGE_BRANCH}

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

  git add ${MAC_FORMULA_DIR}/${MAC_FORMULA_FILE}
  git commit -m "Bumping version to azk v${VERSION}."
)