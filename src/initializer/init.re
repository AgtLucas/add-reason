
/* Symlink:
  ln -sv /Users/nick/projects/add-reason/lib/js/src/initializer /Users/nick/projects/add-reason/node_modules/initializer 
  ln -sv "$(pwd)/lib/js/src/initializer" "$(pwd)/node_modules/<ALIAS>"
                directory   ^^^^^^^^^^^         target
                            we need this
*/
open Utils;
open GenericBindings;

module InitCommand {
  let defaultCompiledDest = "/lib/js";

  let getCompleteMessage = (finishWithFailure, name) : string => {
    switch finishWithFailure {
      | true =>
        Printf.sprintf("%s%s See which step went wrong", 
          getEmoji("no_entry_sign"), red("fail"))
      | false =>
        let example = Printf.sprintf("import your compiled code with `const pkg = require('%s');`", name) |> bold;
        Printf.sprintf("%s%s\n%s %s", 
          getEmoji("sparkles"), green("done"), altCodeDirectional, example)
    };
  };

  let performLinking = (position, name, directory, rootDirectory) : bool => {
    open Path;
    let linkToNodeModules = combinePaths([rootDirectory, "node_modules"]);
    let source = combinePaths([rootDirectory, defaultCompiledDest, directory]);
    let dest = combinePaths([linkToNodeModules, name]);
    let success = Fs_Polyfill.attemptToLink(position, source, dest);
    success
  };

  let performConfigCreation = (position, name, directory, rootDirectory) : bool => {
    /* let success = attemptToCreateConfig */
    let (index, total) = position;
    let position = Printf.sprintf("[%d/%d]", index, total) |> gray;
    Printf.sprintf("%s %sCreating config... %s", position, getEmoji("page_with_curl"), green("success"))
      |> Js.log;
    true
  };

  let execute = (steps, name, directory, rootDirectory) : bool => {
    let total = List.length(steps);
    let finishWithFailure = ref(false);
    let rec loop = (steps, index) : unit =>
      switch steps {
        | [cur] => 
          let success = cur((index, total), name, directory, rootDirectory);
          if (!success) { finishWithFailure := true }
        | [cur, ...rest] =>
          let success = cur((index, total), name, directory, rootDirectory);
          if (!success) { finishWithFailure := true };
          loop(rest, index + 1)
        | _ => ()
      };
    loop(steps, 1);
    finishWithFailure^
  };

  let main = (name, directory, rootDirectory, version) : unit => {
    Printf.sprintf("add-reason init v%s", version)
      |> white
      |> bold
      |> Js.log;
    let stepsAsFunctions = [
      performConfigCreation,
      performLinking
    ];
    let finishWithFailure = execute(stepsAsFunctions, name, directory, rootDirectory);
    getCompleteMessage(finishWithFailure, name)
      |> Js.log;
  };
};
