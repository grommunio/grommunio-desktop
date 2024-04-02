# grommunio Desktop for Linux

## Table of Contents

- [Install](#install)
- [User Guide](#user-guide)
- [Contributing](#contributing)
- [License](#license)


## Install

If you installed the application via a package manager, it's ready to use in your system. Please follow the [User Guide](#user-guide) for further information.

Otherwise, first locate the extracted directory in your desired directory (e.g. `/opt/grommunio-desktop`) and follow the steps below. (This directory also contains this README here.)

### Desktop launcher

Execute the script file to create a `grommunio.Desktop` file.

```
/opt/grommunio-desktop/create_desktop_file.sh
```

Then move it to the appropriate directory of your desktop environment. For example, on Ubuntu Unity it's `~/.local/share/applications/` for the current user.

```
mv grommunio.Desktop ~/.local/share/applications/
```

### Terminal command

Set a `PATH` environment variable to enable launching from the terminal. For example, you can append the following line into `~/.bashrc`.

```sh
# assuming that /opt/grommunio-desktop/grommunio-desktop is the executable file.
export PATH=$PATH:/opt/grommunio-desktop
```

Alternatively, you can also create a symbolic link for the application.

```sh
sudo ln -s /opt/grommunio-desktop/grommunio-desktop /usr/local/bin/
```

You're now all set! See the [User Guide](#user-guide) below for instructions.


## User Guide

After launching, you need to configure the application to interact with your server.

1. If you don't see a page titled "Settings", select **File** > **Settings...** from the menu bar.
2. Click **Add new server** next to the right of Server Management section.
3. Enter **Name** and a valid **URL**, which begins with either `http://` or `https://`.
4. Click **Add**.
5. Click **Save**.

More guides are available at [grommunio-desktop Documentation](https://docs.mattermost.com/messaging/managing-desktop-app-servers.html).


## Contributing

See [contributing guidelines](https://github.com/mattermost/desktop/blob/master/CONTRIBUTING.md) for reporting bugs, features or submitting pull requests.


## License

Apache License, Version 2.0
