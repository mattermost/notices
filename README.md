### [![Mattermost](https://user-images.githubusercontent.com/33878967/33095422-7c8aa7a4-ceb8-11e7-810a-4b261fdff6d6.png)](https://mattermost.org)

This repository drives what [notices](https://docs.mattermost.com/administration/notices.html) appear in-product for Admins and end users. 

Notices are modals that appear in-product when users meet certain critera as defined by the [notice conditions](https://github.com/mattermost/notices/blob/master/notices.schema.json). Notice modals contain a title, description text, image (optional) and call-to-action button (optional).

[See current notices in production](https://github.com/mattermost/notices/blob/release/notices.json)

![example notice](https://raw.githubusercontent.com/mattermost/notices/master/images/example_notice.png)


### Notice Conditions
Notices can be triggered on the following conditions:



Definitions, link to cheat sheet

table of what can be used and what cannot

## Guidelines

- Only servers running v5.28+ can be targetted for notices
- Admins may have disabled them, but shipped on by-default. 

## Branches

### `release`
This branch is for notices live in production. Any notices or changes merged to `notices.json` on the `release` branch are mirrored to https://notices.mattermost.com/. Servers with notices enabled will check this URL daily for new notices or changes that are then propogated to users when they meet the notice conditions.

Branch protection: 
- Only PM's can merge to the release branch
- PR's require approval from QA before merge  

### `master`
This branch is used by QA to test notices. Any notices or changes merged to `notices.json` on the `master` branch are mirrored to https://notices.mattermost.com/pre-release/notices.json. QA can configure test servers to point to this URL and check for new notices or changes that are propogated to users when they meet the notice conditions. QA can also configure the frequency that servers check this URL for updates to speed up testing purposes. 

Branch protection: 
- PM's and QA can merge or commit directly to the master branch
- PR's do not require approval to merge


## How to create a notice

### Guidelines


1. Open a PR to add your notice to the `notices.json` on the `release` branch
  

x notices max...
how to use the ID field


### Adding an image


## FAQ

### Troubleshooting

If checks aren't passing

If notice is not appearing, check the URL

### When do notices pop-up for users?
If a user meets the conditions to show a notice, the modal appears on first websocket connection of the day (similar to the Github plugin daily digest).

### Do we have telemetry on individual notices?
Yes, we track  

### How long will it take for my notice to go live for users?




