import cv2
import numpy as np
import pandas as pd

# === PARAMÈTRES ===
csv_file = "resultsIndiv.csv"
output_file = "video_noms_defile.avi"  # Changement d'extension
video_size = (1280, 720)
fps = 30
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 2
thickness = 3
font_color = (255, 255, 255)
line_height = 60
scroll_speed = 4

# === CHARGER ET TRIER LE CSV ===
df = pd.read_csv(csv_file)
df = df.sort_values(by="username")

lines = []
for _, row in df.iterrows():
    nom = row['username']
    points = row['pixelsColored']
    lines.append(f"{nom} - {points} points")

total_text_height = len(lines) * line_height + video_size[1]
canvas = np.zeros((total_text_height, video_size[0], 3), dtype=np.uint8)

y_pos = video_size[1]
for line in lines:
    (text_width, _), _ = cv2.getTextSize(line, font, font_scale, thickness)
    x = (video_size[0] - text_width) // 2
    cv2.putText(canvas, line, (x, y_pos), font, font_scale, font_color, thickness)
    y_pos += line_height

num_frames = (total_text_height - video_size[1]) // scroll_speed + 1

fourcc = cv2.VideoWriter_fourcc(*'XVID')  # Codec plus compatible
out = cv2.VideoWriter(output_file, fourcc, fps, video_size)

for i in range(num_frames):
    y_start = i * scroll_speed
    frame = canvas[y_start:y_start + video_size[1], 0:video_size[0]]
    out.write(frame)

out.release()
print(f"Vidéo générée : {output_file}")
