import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function SectionHeader({ title, subtitle, action, id }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "flex-end", justifyContent: "space-between", mb: 2.5 }}
    >
      <Box>
        <Typography variant="h2" id={id}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
