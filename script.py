find . -type f | while read fname; do
  newname="$(dirname "$fname")/$(basename "$fname" | sed -E 's/\.[A-Z]+$/\L&/')"
  if [ "$fname" != "$newname" ]; then
    mv "$fname" "$newname"
  fi
done
