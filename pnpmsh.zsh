#!/usr/bin/env zsh
############################################################
# pnpmsh - shell wrap
############################################################
test_workspace_parse(){
  setopt short_loops
    find . -name "*node_modules*" -prune -o -type f -name "package.json" -print -exec grep '"name":' {} \; \
        | sed 's/[],"://g' \
        | while read -r path name package; ${workspace[${package/,/}]}="${(qqq)path/:/};"
        printf  '%s, %s\n' ${(kv)workspace}
}

typeset -gxA workspace
set_workspace() {
  workspace=(
      $(find . -name "*node_modules*" -prune -o \
             -type f -name "package.json" \
             -exec grep '"name":' {} \+ \
      | sed 's/[],"://g' \
      | while read -r path name package; do \
          ${workspace[${package/,/}]} ${(qqq)path/:/}; \
        done;
        printf  '%s, %s\n' ${(kv)workspace})
  )
}

typeset -a apps
typeset -a packages

getfilter() {
  local subpackage=shift;
  echo " --filter $workspace/$subpackage "
}

getcommand() {
  local runcommand=shift;
  echo " pnpm $(getfilter) run ${runcommand} "
}
main() {
  set_workspace;
}

main "$@"
