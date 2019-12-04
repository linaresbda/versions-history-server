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
    return await Git.Repository.open(repoName)
      .then(function (repo) {
        return Git.Tag.list(repo);
      });
  }

  async tagDetails(repoName, tagName) {
    return await Git.Repository.open(repoName)
      .then(async function (repo) {
        return await Git.Reference
          .lookup(repo, `refs/tags/${tagName}`)
          // This resolves the tag (annotated or not) to a commit ref
          .then(ref =>
            ref.peel(Git.Object.TYPE.COMMIT)
          )
          .then(ref =>
            Git.Commit.lookup(repo, ref.id())
          ) // ref.id() now
          .then(commit =>
            (
              {
                tag: tagName,
                hash: commit.sha(),
                date: commit.date().toJSON(),
                message: commit.message()
              }
            )
          );
      });
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
          console.log(`${commit.sha()} ${commit.message()} ${commit.tag()}`)
          NodeGit.Tag.list(repo)
        });

        // Start emitting events.
        history.start();
      })
  }
}

module.exports = GitClass;