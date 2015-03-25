// jshint ignore: start

// questions
// systems
// pre
// pos

// pre(function(context, next) {
//   context.Azkfile.files   // Arquivos e diretÃ³rios que estÃ£o juntos com o Azkfile.js
//   context.Azkfile.systems // Sistemas atuais do Azkfile
//   context.systems         // O equivalente ao system ali de baixo
//   // if (context.Azkfile.files) {
//   //   context.systems.ngrok
//   // }
//   next();
// });

questions({
  ngrok_depends: question("Qual sistema o ngrok depende?", { default: '' }),
  ngrok_key: question("Qual sua chave do ngrok", { default: 'cobra' }),
  image_version: question("azukiapp/ngrok", { default: 'latest' }),
});

systems({
  ngrok: {
    image: { docker: "azukiapp/ngrok:#{question.image_version}" },
    envs: {
      NGROK_KEY: "#{question.ngrok_key}",
    },
    mounts: {
      '/azk/#{system.name}': '.'
    },
    depends: ['#{question.ngrok_depends}'],
  }
});

pos(function(context, next) {
  add_env("NGROK_KEY", context.question.ngrok_key); // .env
  next();
});

// $ azk add ngrok https://gist.github.com/XYASJAHS
// $ azk add ngrok ./ngrok.js
// $ azk add azukiapp/ngrok
// $ azk add git://fulao.me/HAHAHA

// $ azk add ngrok
//    azk.io => ngrok - templates do azk.io

// $ azk add ngrok -i
//    Qual sua chave do ngrok?

// $ azk add ngrok --name my_ngrok -v ngrok_key=XYZ

// REALIDADE! AMANHÃƒ!

// 1 - Arrumar export do Azkfile.js, baseado em um Azkfile.js existente
// 2 - Suportar o `azk add https://gist.github.com` # Simples e direto, questiona sobre o KEY e qual a dependencia

//add("./Azkfile.js", "ngrok", {}, "x")

//add(azkfile_path, system_name, system_json, system_name_depends)

// - mailcatcher
// - ngrok
// - fakes3
