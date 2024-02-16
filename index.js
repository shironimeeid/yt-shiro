const express = require('express');
const app = express();
const ytdl = require('youtubedl-core');
const PORT = process.env.PORT || 4000; // Menggunakan port yang diberikan oleh environment atau default ke 4000

app.use(express.static('public'));

app.get('/download', async (req, res) => {
    const url = req.query.URL;
    const title = req.query.title; // Menambahkan judul sebagai parameter
    const format = req.query.format || 'mp3';

    try {
        let info;
        if (url) {
            info = await ytdl.getInfo(url);
        } else if (title) { // Jika diberikan judul, cari video berdasarkan judul
            const videos = await YT.search(title);
            if (!videos || videos.length === 0) {
                return res.status(404).send('Video tidak ditemukan.');
            }
            // Ambil URL video dari hasil pencarian
            const videoUrl = videos[0].url;
            info = await ytdl.getInfo(videoUrl);
        } else {
            return res.status(400).send('Masukkan URL video atau judul video.');
        }

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
            ytdl(url || info.videoDetails.video_url, { format: 'mp3', filter: 'audioonly' }).pipe(res);
        } else if (format === 'mp4') {
            res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
            ytdl(url || info.videoDetails.video_url, { format: 'mp4' }).pipe(res);
        } else {
            res.status(400).send('Format yang diminta tidak valid.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengunduh konten.');
    }
});

// Jangan panggil app.listen di sini, biarkan Vercel yang menangani proses listening

module.exports = app; // Untuk dapat digunakan oleh Vercel
