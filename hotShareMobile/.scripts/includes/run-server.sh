cd "${METEOR_ROOT}";

# Run meteor server locally with proper settings if specified
if [ "$USE_SETTINGS" = true ]; then
  meteor run --settings $METEOR_SETTINGS;
else
  meteor run;
fi
