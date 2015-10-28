## `Run Project` button

Clicking the `Run Project` button (or `azk button`) on a GitHub repo is the best way to quickly and safely run its code on your local machine. 

![Run project](https://s3-sa-east-1.amazonaws.com/assets.azk.io/run-project-illustrative.png)

To add a `Run Project` button to a repo, you'll just need to add an Azkfile.js to the project and put the following badge in your README.md file (the following example is for a hypothetical repository with the URL `https://github.com/username/repo` and a branch called `azkfile` containing the Azkfile.js):

```
[![Run project](https://s3-sa-east-1.amazonaws.com/assets.azk.io/run-project.png)](http://run.azk.io/start/?repo=username/repo&ref=azkfile)
```

Check out the [`Run Project` Gallery](https://github.com/run-project/gallery/) for examples of up-to-date forks of popular projects using it. If you want to suggest a new project for the gallery, feel free to open an issue or send us a pull request with your project (on the gallery repo on both cases).
