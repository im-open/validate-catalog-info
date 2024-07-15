#!/bin/bash

name=''
expectedMdFile=''
actualMarkdown=''

for arg in "$@"; do
    case $arg in
    --name)
        name=$2
        shift # Remove argument --name from `$@`
        shift # Remove argument value from `$@`
        ;;
    --expectedMdFile)
        expectedMdFile=$2
        shift # Remove argument --expected from `$@`
        shift # Remove argument value from `$@`
        ;;
    --actualMarkdown)
        actualMarkdown=$2
        shift # Remove argument --actual from `$@`
        shift # Remove argument value from `$@`
        ;;
    
    esac
done

echo "
Asserting markdown matches:
Expected markdown file: '$expectedMdFile'"

# Trailing newlines are removed with command substitution so
# add one in here otherwise it won't match the actual markdown
expectedMarkdown="$(cat $expectedMdFile)
"

# Compare the contents
name="markdown"
echo "
Expected $name: 
'$expectedMarkdown'

Actual $name:
'$actualMarkdown'
"

if [ "$expectedMarkdown" != "$actualMarkdown" ]; then
  echo "The expected $name does not match the actual $name."  
  exit 1
else 
  echo "The expected and actual $name values match."
fi