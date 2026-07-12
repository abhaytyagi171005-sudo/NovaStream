@echo off
echo Downloading hero previews in 1080p Full HD...

REM ---- INTERSTELLAR (1080p) ----
yt-dlp -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]" -o "temp_interstellar.mp4" "https://www.youtube.com/watch?v=zSWdZVtXT7E"
ffmpeg -ss 10 -i temp_interstellar.mp4 -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 16 -preset slow -vf "scale=1920:1080" "assets/hero/previews/interstellar.mp4" -y
del temp_interstellar.mp4
echo ✅ Interstellar 1080p done!

REM ---- GAME OF THRONES (1080p) ----
yt-dlp -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]" -o "temp_got.mp4" "https://www.youtube.com/watch?v=KPLWWIOCOOQ"
ffmpeg -ss 10 -i temp_got.mp4 -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 16 -preset slow -vf "scale=1920:1080" "assets/hero/previews/game-of-thrones.mp4" -y
del temp_got.mp4
echo ✅ Game of Thrones 1080p done!

REM ---- THE MATRIX (1080p) ----
yt-dlp -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]" -o "temp_matrix.mp4" "https://www.youtube.com/watch?v=vKQi3bBA1y8"
ffmpeg -ss 10 -i temp_matrix.mp4 -t 8 -c:v libx264 -c:a aac -movflags +faststart -crf 16 -preset slow -vf "scale=1920:1080" "assets/hero/previews/the-matrix.mp4" -y
del temp_matrix.mp4
echo ✅ The Matrix 1080p done!

echo 🎬 All 1080p Full HD previews downloaded!
pause