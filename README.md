# [![Mattermost](https://user-images.githubusercontent.com/33878967/33095422-7c8aa7a4-ceb8-11e7-810a-4b261fdff6d6.png)](https://mattermost.org)

This repository drives what [notices](https://docs.mattermost.com/administration/notices.html) appear in-product for Admins and end users.

Notices are modals that appear in-product when users meet certain critera as defined by the [notice conditions](https://github.com/mattermost/notices/blob/master/notices.schema.json). Notice modals contain a title, description text, image (optional) and call-to-action button (optional).

[See current notices in production](https://github.com/mattermost/notices/blob/release/notices.json).

![example notice](https://raw.githubusercontent.com/mattermost/notices/master/images/example_notice.png)

## Notice Conditions

Notices can be triggered on the following conditions:

**External Dependency**: If an external dependency going to be deprecated for a certain version.

**User Role** (sysadmins, all): default "all" if not specified.

**SKU** (team, e0, e10, e20, all): default "all" if not specified.

**Client Type** (desktop, web, all): default "all" if not specified. Mobile client targeting is not supported yet.

**Desktop Version** (see [cheat sheet](https://docs.google.com/document/d/1aqBGdeNeOqB8OQQivgBA7avTL2yngE4QEBapSmH3hrE/edit?ts=5f7752c9%5C#heading=h.3rfcbukbair) for syntax): default all if not specified.

**Server Version** (see [cheat sheet](https://docs.google.com/document/d/1aqBGdeNeOqB8OQQivgBA7avTL2yngE4QEBapSmH3hrE/edit?ts=5f7752c9%5C#heading=h.j2dh2p8pljjh) for syntax): default "all" if not specified. Only server versions v5.28 and later can be targeted.

**Display Date** (see [cheat sheet](https://docs.google.com/document/d/1aqBGdeNeOqB8OQQivgBA7avTL2yngE4QEBapSmH3hrE/edit?ts=5f7752c9%5C#heading=h.ytgiix2d4t2o) for syntax): default "all" if not specified.

**Instance Type** (see [cheat sheet](https://docs.google.com/document/d/1aqBGdeNeOqB8OQQivgBA7avTL2yngE4QEBapSmH3hrE/edit?ts=5f7752c9%5C#heading=h.xmdvclunh3tg) for syntax): default "all" if not specified.

**Server Configuration**: Not available yet.

**User Account Configuration**: Not available yet.

**Mobile Version**: Not available yet.

**Number of posts**: Not available yet.

**Number of Users**: Not available yet.

Resources:

[Condition cheat sheet](https://docs.google.com/document/d/1aqBGdeNeOqB8OQQivgBA7avTL2yngE4QEBapSmH3hrE/edit?ts=5f7752c9%5C)

[Notices schema](https://github.com/mattermost/notices/blob/master/notices.schema.json)

## Branches

### `release`

This branch is for notices live in production. Any notices or changes merged to `notices.json` on the `release` branch are mirrored to https://notices.mattermost.com/. Servers with notices enabled will check this URL once per hour for new notices or changes that are then propogated to users when they meet the notice conditions.

Branch protection:

- Only PM's can merge to the release branch
- PR's require approval from QA before merge  

### `master`

This branch is used by QA to test notices. Any notices or changes merged to `notices.json` on the `master` branch are mirrored to https://notices.mattermost.com/pre-release/notices.json. QA can configure test servers to point to this URL and check for new notices or changes that are propogated to users when they meet the notice conditions. QA can also configure the frequency that servers check this URL for updates to speed up testing purposes. 

Branch protection:

- PM's and QA can merge or commit directly to the master branch
- PR's do not require approval to merge

## Creating a notice

### Before opening a PR

1. Check how many notices are live in production in `notices.json`: As a general guideline we should aim to have < 5 live notices that could apply to any unique user to avoid spamming. Please reach out to the PM owner for any live notices if we are at the threshold and need to consider removing or replacing a notice. 
2. Consider your audience: Carefully consider who should see this notice. Do we need to spam all users or should we target System Admins only? 
3. Consider narrowing your reach: Consider narrowing your target audience further by using additional conditions such as SKU, client, client versions, server versions, server configs.

### Opening a PR

Open a PR against the `release` branch to add your notice to the `notices.json`. See this [example PR] XXXXXX will submit a PR for the v5.29 server upgrade

- **"id"**: must be a **unique** alpha-numeric value. The server uses the notice ID to store if a user has seen a particular notice. It is recommended to choose an ID that will be recognizable in telemetry.
- **"title"**: configure the title of the modal. This appears in larger bold font (supports emoji).
- **"description"**: configure the description text that appears below the title (supports full markdown and emoji).
- **"image"** (optional): configure the hero image that appears below the description text. It is recommended to use a 16:9 aspect ratio image ([example](https://github.com/mattermost/notices/blob/master/images/desktop_upgrade.png)). Images should be added to the `images` folder in your PR branch, then in the `notices.json` add the image URL in the format `https://raw.githubusercontent.com/mattermost/notices/release/images/image_name.image_format` ([example](https://github.com/mattermost/notices/pull/49/files#diff-11766faeb8c25f77d7dbf8e61fd0e9fc8cd1a08858d6b1f8867715a570bfd9d9R13)).
- **"actionText"** (optional): configure the text in the call-to-action button for this notice. If nothing is specified this reverts to "Done". 
- **"actionParam"** (optional): configure the action that the call-to-action button takes. This can be an external URL or system console page.  

### After opening a PR

1. Please add the "PM Review" and "QA Review" labels. Recommended reviewers are @esethna (PM) and @ogi.m or @jgilliam17 (QA). 
2. QA will test the notice on the `master` branch and verify the conditions are working as expected then approve the PR. Once reviews are complete the PR can be merged to the `release` branch.
3. Once merged, verify the changes have been mirrored to https://notices.mattermost.com/ (this may take up to 15 minutes post-merge).

Servers check for notices https://notices.mattermost.com/ once per hour, so it will take up to 1 hour for any newly merged notices to appear in the wild.

## FAQ

### Troubleshooting

#### Checks aren't passing on my PR

The PR checks have automated syntax checking to verify the sytax used for conditions. XXXXXX QA how do you check syntax?

#### Checks won't complete and stuck in a yellow state

Please check with the Release team in the Developers: DevOps channel.

#### When do notices pop-up for users?

If a user meets the conditions to show a notice the modal appears on first websocket connection of the day (similar to the Github plugin daily digest).

#### Do we have telemetry on individual notices?

Yes, we track impressions and clicks on the call-to-action button for every notice ([telemetry PR](https://github.com/mattermost/mattermost-webapp/pull/6934)).  
