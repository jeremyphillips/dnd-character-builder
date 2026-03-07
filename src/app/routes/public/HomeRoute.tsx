import { CharacterBuilderLauncher } from "@/features/characterBuilder/components";
import Typography from "@mui/material/Typography";

export default function HomeRoute() {
  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dungeon &amp; Dragons Character Generator
      </Typography>
      <p>Welcome! Create and manage your D&amp;D characters.</p>

      <CharacterBuilderLauncher />
    </div>
  )
}
