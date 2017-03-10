
set -u -e 

if which node7 >/dev/null
then 
  node7 --harmony ~/node_modules/rescan/lib/index.js
elif ! which node
then
  exit 1
elif node -v | grep -q '^[0-6]\.'
then
  node -v
  exit 1
else
  node --harmony ~/node_modules/rescan/lib/index.js
fi

