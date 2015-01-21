# Azkfile.js

The **Azkfile.js** is the backbone of the functioning of `azk`. Its main function is to describe the application architecture and define where is the main directory of the application.

It is expected that the **Azkfile.js** will be included with the application files in your version control. This allows other team members to use `azk` to control the environment and the applications to run in their own stations.

As suggested by the `.js` extension the **Azkfile.js** is written in JavaScript, but no advanced knowledge of JavaScript is expected to edit it. Its logic is really simple and basically describes how `azk` must provision the environment for running the systems that make up your application.