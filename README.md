## per avviare il sito sul server

pm2 start npm --name "prezzibenzina" -- run start
pm2 start node_modules/next/dist/bin/next --name "prezzibenzina" -i max -- start
