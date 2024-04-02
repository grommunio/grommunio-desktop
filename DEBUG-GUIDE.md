# grommunio chat Desktop v5.6.0
Based on Mattermost Desktop 5.6.0

[Manual for setup](https://developers.mattermost.com/contribute/more-info/desktop/developer-setup/) \
[Manual for packaging](https://developers.mattermost.com/contribute/more-info/desktop/packaging-and-releasing/)

## Building
**You have to build the app for a specific os on the respective os**


- Clean:
  - `npm run clean` -> cleans installation, release, cache, ...
  - `npm install` \
    or
  - `rm -r release` -> no reinstallation necessary
- `npm run build`
- `npm run start`
- (`npm run watch`)

## Packaging
 - `npm run build`
 - MacOS: `npm run package:mac-with-universal`
 - Linux: `npm run package:linux`
 - Windows:
   - zip-file: `npm run package:windows` \
        or
   - msi-installer: `./scripts/Makefile.ps1 build` & `git add -A; git reset --hard HEAD`

## Signing

- MacOS: automatically with Certificate in KeyChain
- Windows:
  - need `.pfx`-file

## Debugging
### Problems with node-packages
- `npm run clean`
- `rm package-lock.json`
- `npm install`

### Errors
#### *...\scripts\msi_installer.wxs : Duplicate symbol 'Property:...' found*
on Windows
- run `git add -A; git reset --hard HEAD` after every msi-build \
    or
- remove `Property:...`-line in `.\scripts\msi_installer.wxs`

#### Can not remove .dll-file
on Windows
- close all grommunio-chat Windows & also close it in the Task-Manager

### *Command failed: ... /grommunio-chat.app: rejected*
on Mac:
> Command failed: spctl --assess --type execute --verbose --ignore-cache --no-cache /Users/jensherman/Code/grommunio-chat-desktop/release/mac/grommunio-chat.app /Users/jensherman/Code/grommunio-chat-desktop/release/mac/grommunio-chat.app: rejected

- no impact noticed -> build will be produced anyway, so just ignore it
