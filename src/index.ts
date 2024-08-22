import { spawn } from "node:child_process";
import { join, resolve } from "path";
import { readFile } from "fs/promises";
import { Database } from "sqlite3";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

export interface AppleScriptNote {
  id: string;
  title: string;
  content: string;
}

export const parseAppleScriptOutput = (output: string): AppleScriptNote[] => {
  try {
    return output
      .split("__________")
      .filter(Boolean)
      .map((noteStr) => {
        if (!noteStr.includes("----------")) {
          console.error(noteStr);
          throw new Error("Invalid note format");
        }
        const [id, title, content] = noteStr.split("----------");
        const appleScriptNote: AppleScriptNote = {
          id: id.trim() || "",
          title: title.trim() || "",
          content: content.trim() || "",
        };
        return appleScriptNote;
      });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to parse AppleScript output");
  }
};

(async () => {
  if (!process.env.DATABASE_PATH) {
    console.error("DATABASE_PATH environment variable is not set.");
    return;
  }
  // Resolve the DATABASE_PATH relative to the root directory
  const dbPath = join(process.cwd(), process.env.DATABASE_PATH);

  console.log("Database path:", dbPath);

  const db = new Database(dbPath);

  await db.run(
    "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT, content TEXT)"
  );

  try {
    const appleScriptPath = join(__dirname, "get-journal-entries.applescript");
    console.log(appleScriptPath);
    const appleScript = await readFile(appleScriptPath, "utf8");

    const process = spawn("osascript", ["-e", appleScript]);

    let output = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    process.on("close", async (code) => {
      if (code !== 0) {
        console.error(`Process exited with code: ${code}`);
        return;
      }

      const notes = parseAppleScriptOutput(output);

      for (const note of notes) {
        const { title, content } = note;
        await db.run("INSERT INTO notes (title, content) VALUES (?, ?)", [
          title,
          content,
        ]);
      }

      db.close();
    });
  } catch (error) {
    console.error("Failed to read AppleScript file:", error);
  }
})();
