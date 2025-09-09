#!/bin/bash
cd /home/kavia/workspace/code-generation/storycraft-collaborative-59320-59330/story_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

