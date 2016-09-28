import { t } from 'azk';
import View from './view';

const TRANSLATION_KEY = 'commands.views.image_pull';

export default class ImagePullView extends View {
  render(msg) {
    if (msg.type !== "pull_msg") {
      return msg;
    }

    if (msg.end) {
      this.ok(`${TRANSLATION_KEY}.pull_ended`, msg);
      return false;
    }

    // parse messages by type
    let status = msg.statusParsed;

    try {
      switch (status.type) {
        case 'pulling_from':
          this.newProgress(':id: :msg [:bar] :progress', {
            complete: '=',
            incomplete: ' ',
            width: 30,
            total: 100,
          });
          break;
        case 'pulling_fs_layer':
        case 'download':
        case 'pulling_extracting':
          let progress = msg.progressDetail;
          let tokens   = {
            id: t(`${TRANSLATION_KEY}.${status.type}`, msg),
            msg: status.msg,
            progress: progress.label || '',
          };
          this.tickBar(msg.id, progress.current, tokens, progress.total);
          break;
        case 'pulling_digest':
          this.ok(`${TRANSLATION_KEY}.digest`, status);
          break;
      }
    } catch (e) {
      // Ignore progress errors;
    }
  }
}
