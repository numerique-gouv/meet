# LiveKit Egress

LiveKit offers Universal Egress, designed to provide universal exports of LiveKit sessions or tracks to a file or stream data.
It is kept in a separate system to keep the load off the [Single Forwarding Unit (SFU)](https://docs.livekit.io/reference/internals/livekit-sfu/) and avoid impacting real-time audio or video performance/quality.

## Getting started

### Prerequisite

1. **Verify Services**: Ensure the LiveKit server and Egress service are both up and running.
2. **Install CLI**: Confirm that the LiveKit CLI utility is installed on your system.
3. **Set Permissions**: Since the Egress service does not run as the root user, you need to grant write permissions to all users for the output directory. Update the permissions of the `docker/livekit/out` folder before starting the docker-compose stack:

```bash
$ chmod o+w ./docker/livekit/out
```

### Make a recording

LiveKit provides examples for creating Egress requests, which you can find [here](https://github.com/livekit/livekit-cli/tree/main/cmd/livekit-cli/examples). One of these examples has been added to the repository under `docker/livekit/egress-example`.

Follow these steps to start an Egress request:

1. **Create a Room**: Create a room either through the frontend or using the `livekit-cli` command.
2. **Retrieve Room Name**: Get the room's name (e.g., the UUID4 in the URL from the frontend).
3. **Update Configuration**: Edit the `docker/livekit/egress-example/room-composite-file.json` file with your room's name.
4. **Start Egress Request**: Initiate a new Egress request.
```bash
$ livekit-cli start-room-composite-egress --request ./docker/livekit/egress-example/room-composite-file.json

Using default project meet
EgressID: EG_XXXXXXXXXXXX Status: EGRESS_STARTING
```

You can list running Egress:

```Bash
$ livekit-cli list-egress

Using default project meet
+-----------------+---------------+----------------+--------------------------------------+--------------------------------+-------+
|    EGRESSID     |    STATUS     |      TYPE      |                SOURCE                |           STARTED AT           | ERROR |
+-----------------+---------------+----------------+--------------------------------------+--------------------------------+-------+
| EG_XXXXXXXXXXXX | EGRESS_ACTIVE | room_composite | your-room-name-XXXXXXXXXXX-XXXXXXXXX | 2024-07-05 18:11:37.073847924  |       |
|                 |               |                |                                      | +0200 CEST                     |       |
+-----------------+---------------+----------------+--------------------------------------+--------------------------------+-------+
```

You can stop the Egress at any time once your recording is finished:
```Bash
$ livekit-cli stop-egress --id EG_XXXXXXXXXXXX

Using default project meet
Stopping Egress EG_XXXXXXXXXXXX
```

The Egress should be marked as completed:
```bash
$ livekit-cli list-egress

Using default project meet
+-----------------+-----------------+----------------+--------------------------------------+--------------------------------+-------+
|    EGRESSID     |     STATUS      |      TYPE      |                SOURCE                |           STARTED AT           | ERROR |
+-----------------+-----------------+----------------+--------------------------------------+--------------------------------+-------+
| EG_XXXXXXXXXXXX | EGRESS_COMPLETE | room_composite | your-room-name-XXXXXXXXXXX-XXXXXXXXX | 2024-07-05 18:11:37.073847924  |       |
|                 |                 |                |                                      | +0200 CEST                     |       |
+-----------------+-----------------+----------------+--------------------------------------+--------------------------------+-------+
```


Finally, you should find two new files in the `./docker/livekit/out directory`: an `.mp4` recording and its associated metadata in a `.json` file:
```bash
$ ls ./docker/livekit/out

your-room-name-YYYY-MM-DDTHHMMSS.mp4
your-room-name-YYYY-MM-DDTHHMMSS.mp4.json
```

### Resources

[Official Egress repository](https://github.com/livekit/egress)
