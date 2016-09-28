import { _ } from 'azk';
import View from './view';

export default class VersionView extends View {
  render(data, with_logo = false) {
    let formated = this.format(data);
    this.output(with_logo ? this.add_logo(formated) : formated.join("\n"));
  }

  add_logo(data) {
    let final = (`
               ##########
           ##################
         ######################
        ########################
       #################  #######
      ##################  ########
     ####     ##       #  ###  ####
     ########  ####   ##  #  ######
     ###  ###  ##   ####  ##  #####
      ##    #  #       #  ###  ###
       ##########################
        ########################
         ######################
            ################
               ##########
    `).split("\n");

    // Adding color in logo
    let larger_line = 0;
    final = _.map(final, (line) => {
      line = this.c.blue(line);
      larger_line = line.length > larger_line ? line.length : larger_line;
      return line;
    });

    let start = ((final.length - data.length) / 2) | 0;
    _.each(data, (line) => {
      let current  = final[start];
      let space    = Array(larger_line - current.length + 4).join(' ');
      final[start] = `${current}${space}${line}`;
      start++;
    });

    return final.join("\n");
  }

  format(data) {
    return [
      `${this.c.cyan("Version")}   : ${data.version}`,
      `${this.c.cyan("OS")}        : ${data.os}`,
      `${this.c.cyan("Agent")}     : ${data.agent_running}`,
      `${this.c.cyan("Docker")}    : ${data.docker.Version}`,
      `${this.c.cyan("Uses VM")}   : ${data.use_vm}`,
      `${this.c.cyan("VirtualBox")}: ${_.trim(data.vbox_version)}`,
    ];
  }
}
