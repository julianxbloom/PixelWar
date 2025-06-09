from moviepy.editor import *
import pandas as pd

# Charger le CSV
df = pd.read_csv("ton_fichier.csv")

# Paramètres de la vidéo
clips = []
duration_per_clip = 2  # secondes par nom
video_size = (1280, 720)

# Créer un clip pour chaque ligne
for index, row in df.iterrows():
    nom = row['username']
    points = row['pixelsColored']
    text = f"{nom} - {points} points"

    # Créer un clip texte
    txt_clip = TextClip(text, fontsize=70, color='white', font='Arial-Bold', size=video_size, method='caption')
    txt_clip = txt_clip.set_duration(duration_per_clip).set_position('center').on_color(
        size=video_size,
        color=(0, 0, 0),  # fond noir
        col_opacity=1
    )

    clips.append(txt_clip)

# Assembler tous les clips
final_video = concatenate_videoclips(clips, method="compose")

# Exporter la vidéo
final_video.write_videofile("video_noms.mp4", fps=24)
