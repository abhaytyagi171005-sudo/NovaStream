@echo off
echo Downloading hero previews...

REM ---- DUNE: PART TWO ----
yt-dlp -f "best[height<=720][ext=mp4]" -o "temp_dune.mp4" "https://www.youtube.com/watch?v=8Bk2Tt-EXeE"
ffmpeg -ss 10 -i "temp_dune.mp4" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "assets/hero/previews/dune2.mp4" -y
del temp_dune.mp4
echo ✅ Dune: Part Two done!

REM ---- THE BATMAN ----
yt-dlp -f "best[height<=720][ext=mp4]" -o "temp_batman.mp4" "https://www.youtube.com/watch?v=mqqft2x_Aa4"
ffmpeg -ss 10 -i "temp_batman.mp4" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "assets/hero/previews/the-batman.mp4" -y
del temp_batman.mp4
echo ✅ The Batman done!

REM ---- INTERSTELLAR ----
yt-dlp -f "best[height<=720][ext=mp4]" -o "temp_interstellar.mp4" "https://www.youtube.com/watch?v=zSWdZVtXT7E"
ffmpeg -ss 10 -i "temp_interstellar.mp4" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "assets/hero/previews/interstellar.mp4" -y
del temp_interstellar.mp4
echo ✅ Interstellar done!

REM ---- GAME OF THRONES ----
yt-dlp -f "best[height<=720][ext=mp4]" -o "temp_got.mp4" "https://www.youtube.com/watch?v=KPLWWIOCOOQ"
ffmpeg -ss 10 -i "temp_got.mp4" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "assets/hero/previews/game-of-thrones.mp4" -y
del temp_got.mp4
echo ✅ Game of Thrones done!

REM ---- THE MATRIX ----
yt-dlp -f "best[height<=720][ext=mp4]" -o "temp_matrix.mp4" "https://www.youtube.com/watch?v=vKQi3bBA1y8"
ffmpeg -ss 10 -i "temp_matrix.mp4" -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 23 -preset medium "assets/hero/previews/the-matrix.mp4" -y
del temp_matrix.mp4
echo ✅ The Matrix done!

echo 🎬 All previews downloaded!
pause