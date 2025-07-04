import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function FlapDetailModal({
  selectedFlap,
  setSelectedFlap,
  flaps,
  currentIndex,
  setCurrentIndex,
}) {
  const handleClose = () => setSelectedFlap(null);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedFlap(flaps[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < flaps.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedFlap(flaps[newIndex]);
    }
  };

  return (
    <Dialog open={!!selectedFlap} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Flap Detail
        <IconButton
          onClick={handleClose}
          data-testid="close-button"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {selectedFlap && (
          <>
            <Typography>
              <strong>Temperature:</strong>{" "}
              {selectedFlap.temperature.toFixed(2)} °C
            </Typography>
            <Typography>
              <strong>Timestamp:</strong>{" "}
              {new Date(selectedFlap.timestamp).toLocaleString()}
            </Typography>
            <Box
              component="img"
              src={selectedFlap.image_url}
              alt="Flap"
              sx={{ width: "100%", mt: 2, borderRadius: 2 }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === flaps.length - 1}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}
