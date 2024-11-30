find . -type f -name "*gnrtd*.pdf" -print0 | xargs -0 -P 4 -I {} sh -c '

    pdftotext -layout -nopgbrk -f 2 -l 2 -x 90 -y 115 -W 540 -H 585 "{}" - |

    awk "NF && \$1 != 15" > "${1%.pdf}.txt"

' _ {}