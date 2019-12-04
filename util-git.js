var Git = require("nodegit");

class GitClass {
  constructor() { }

  async clone(repoUrl, repoName) {
    console.log("Cloning...")
    await Git.Clone(repoUrl, repoName).then(() =>
      console.log("Repo is cloned")
    ).catch(err => {
      if (err.errno === -4) {
        console.log("Repo already exists");
      } else {
        throw (err);
      }
    });
  }

  async pull(repoName) {
    await Git.Repository.open(repoName)
      .then(function (repo) {
        return repo.fetchAll();
      })
      // Now that we're finished fetching, go ahead and merge our local branch
      // with the new one
      .then(repository => function () {
        return repository.mergeBranches("master", "origin/master");
      })
      .done(function () {
        console.log("Done!");
      });
  }

  async tags(repoName) {
    let repo = await Git.Repository.open(repoName);
    return await Git.Tag.list(repo);
  }

  async tagDetails(repoName, tagName) {
    let repo = await Git.Repository.open(repoName);
    let ref = await Git.Reference.lookup(repo, `refs/tags/${tagName}`);
    let tag = await ref.peel(Git.Object.TYPE.COMMIT);
    let commit = await Git.Commit.lookup(repo, tag.id())
    let result = {
      tag: tagName,
      hash: commit.sha(),
      date: commit.date().toJSON(),
      message: commit.message()
    }
    return result;
  }

  async log(repoName) {
    await Git.Repository.open(repoName)
      // Open the master branch.
      .then(function (repo) {
        return repo.getMasterCommit();
      })
      // Display information about commits on master.
      .then(function (firstCommitOnMaster) {
        // Create a new history event emitter.
        var history = firstCommitOnMaster.history();

        // Listen for commit events from the history.
        history.on("commit", function (commit) {
          console.log(`${commit.sha()} ${commit.message()}`)
        });

        // Start emitting events.
        history.start();
      })
  }
}

module.exports = GitClass;