
set -u -e 

if which node7 >/dev/null
then 
  node7 --harmony lib/index.js
elif ! which node
then
  exit 1
elif node -v | grep -q '^[0-6]\.'
then
  node -v
  exit 1
else
  node --harmony lib/index.js
fi

