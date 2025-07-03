import path from "path";
import Play from "play-sound";
import fs from "fs";

// these shouldnt be needed but are here because of the emulator functionality
import { dirname as PomoDir } from 'node:path';
import { fileURLToPath as PomoFile } from 'url';


const filename = "bell.mp3";
const player = Play();

export function notify({ onError }: { onError: (message: string) => void }) {
  const __filename = PomoFile(import.meta.url);
  const __dirname = PomoDir(__filename);
  
  var filePath = path.resolve(__dirname, filename);
  if (fs.existsSync(filePath)) {
    player.play(filePath, function (err) {
      if (err) onError(err.message);
    });
  } else {
    onError("notify: Missing file " + filename);
  }
}
