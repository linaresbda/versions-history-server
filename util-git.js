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

  async log() {
    await Git.Repository.open("nodegit")
      // Open the master branch.
      .then(function (repo) {
        return repo.getMasterCommit();
      })
      // Display information about commits on master.
      .then(function (firstCommitOnMaster) {
        // Create a new history event emitter.
        var history = firstCommitOnMaster.history();

        // Create a counter to only show up to 9 entries.
        var count = 0;

        let listCommit = [];
        // Listen for commit events from the history.
        history.on("commit", function (commit) {
          // Disregard commits past 9.
          if (++count >= 9) {
            return;
          }

          let comm = {};

          // Show the commit sha.
          console.log("commit " + commit.sha());

          // Store the author object.
          var author = commit.author();

          // Display author information.
          console.log("Author:\t" + author.name() + " <" + author.email() + ">");

          // Show the commit date.
          console.log("Date:\t" + commit.date());

          // Give some space and show the message.
          console.log("\n    " + commit.message());
        });

        // Start emitting events.
        history.start();
      })
  }
}

module.exports = GitClass;