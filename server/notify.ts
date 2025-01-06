import path from "path";
import Play from "play-sound";
import fs from "fs";

const filename = "bell.mp3";
const player = Play();

export function notify({ onError }: { onError: (message: string) => void }) {
  var filePath = path.resolve(__dirname, filename);
  if (fs.existsSync(filePath)) {
    player.play(filePath, function (err) {
      if (err) onError(err.message);
    });
  } else {
    onError("notify: Missing file " + filename);
  }
}
