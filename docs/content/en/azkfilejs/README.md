# Azkfile.js

The **Azkfile.js** is the backbone of the functioning of `azk`. Its main function is to describe the application architecture and define where the main directory of the application is located.

It is expected that the **Azkfile.js** will be included with the application files in your version control. This allows other team members to use `azk` to control the environment and the applications to run in their own stations.

As suggested by the `.js` extension the **Azkfile.js** is written in JavaScript, but no advanced knowledge of JavaScript is needed to edit it. Its logic is really simple and basically describes how `azk` must provision the environment for running the systems that make up your application.

All properties available for the **Azkfile.js** and their descriptions can be found in the [Reference section](../reference/azkfilejs/README.md).

# Full Azkfile.js example

Obs: this is just an example with all the choices available on `Azkfile.js`, it is not a valid configuration for an application. Use it only as reference.

!INCLUDE "../../common/azkfilejs/full_example.md"
