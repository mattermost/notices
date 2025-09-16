# [![Mattermost](https://user-images.githubusercontent.com/33878967/33095422-7c8aa7a4-ceb8-11e7-810a-4b261fdff6d6.png)](https://mattermost.org)

This repository drives what [notices](https://docs.mattermost.com/administration/notices.html) appear in-product for Admins and end users.

Notices are modals that appear in-product when users meet certain criteria as defined by the [notice conditions](https://github.com/mattermost/notices/blob/master/notices.schema.json). Notice modals contain a title, description text, image (optional) and call-to-action button (optional).

[See current notices in production](https://github.com/mattermost/notices/blob/release/notices.json).

![example notice](https://raw.githubusercontent.com/mattermost/notices/master/images/example_notice.png)

## Notice Conditions

Notices can be triggered on the following conditions. See [schema](https://github.com/mattermost/notices/blob/master/notices.schema.json) for syntax:

- **External Dependency**: If an external dependency is going to be deprecated for a certain version.

- **User Role** (sysadmins, all): default "all" if not specified.

- **SKU** (team, e0, e10, e20, all): default "all" if not specified.

- **Client Type** (desktop, web, all): default "all" if not specified. Mobile client targeting is not supported yet.

- **Desktop Version**: Default "all" if not specified.

- **Server Version**: Default "all" if not specified. Only server versions v5.28 and later can be targeted. If targeting cloud instances with your notice, the server version condition is ignored.

- **Display Date**: Default "all" if not specified.

- **Instance Type**: Default "both" if not specified.

- **Server Configuration**: If server congif settings match specific values. 

- **User Account Configuration**: Not available yet.

- **Mobile Version**: Not available yet.

- **Number of posts**: Not available yet.

- **Number of Users**: Not available yet.

Resources:

- [Notices schema](https://github.com/mattermost/notices/blob/master/notices.schema.json)

## Branches

### `release`

This branch is for notices live in production. Any notices or changes merged to `notices.json` on the `release` branch are mirrored to https://notices.mattermost.com/. Servers with notices enabled will check this URL once per hour for new notices or changes that are then propagated to users when they meet the notice conditions.

Branch protection:

- Only PM's can merge to the release branch
- PR's require approval from QA before merge  

### `master`

This branch is used to test notices. Any notices or changes merged to `notices.json` on the `master` branch are mirrored to `https://notices.mattermost.com/pre-release/notices.json`. Anyone testing the notice can configure test servers to point at this URL and check for new notices or changes that are propagated to users when they meet the notice conditions. Configure the frequency of the test server to check this URL for updates to speed up testing purposes. See [How to Test Notices via `/cloud` Plugin](#how-to-test-notices-via-cloud-plugin).

Branch protection:

- PM's and QA can merge or commit directly to the master branch
- PR's do not require approval to merge

## Creating a notice

### Before opening a PR

1. Check how many notices are live in production in `notices.json`: As a general guideline we should aim to have < 5 live notices that could apply to any unique user to avoid spamming. Please reach out to the PM owner for any live notices if we are at the threshold and need to consider removing or replacing a notice. 
2. Consider your audience: Carefully consider who should see this notice. Do we need to spam all users or should we target System Admins only? 
3. Consider narrowing your reach: Consider narrowing your target audience further by using additional conditions such as SKU, client, client versions, server versions, server configs.

### Opening a PR

**Open a PR against the `release` branch** to add your notice to the `notices.json`. See this [example PR](https://github.com/mattermost/notices/pull/220) shows the v6.0 server upgrade notice.

- **"id"**: must be a **unique** alpha-numeric value. The server uses the notice ID to store if a user has seen a particular notice. It is recommended to choose an ID that will be recognizable in telemetry. Do not update existing notice ID's unless you intend for them to re-trigger for users (such as updating an existing notice for a new release, ie updating the v5.38 notice to a v5.39 notice).
- **"title"**: configure the title of the modal. This appears in larger bold font (supports emoji).
- **"description"**: configure the description text that appears below the title (supports full markdown and emoji).
- **"image"** (optional): configure the hero image that appears below the description text. It is recommended to use a 16:9 aspect ratio image ([example](https://github.com/mattermost/notices/blob/master/images/desktop_upgrade.png)). Images should be added to the `images` folder in your PR branch, then in the `notices.json` add the image URL in the format `https://raw.githubusercontent.com/mattermost/notices/release/images/image_name.image_format` ([example](https://github.com/mattermost/notices/pull/49/files#diff-11766faeb8c25f77d7dbf8e61fd0e9fc8cd1a08858d6b1f8867715a570bfd9d9R13)).
- **"actionText"** (optional): configure the text in the call-to-action button for this notice. If nothing is specified this reverts to "Done". 
- **"actionParam"** (optional): configure the action that the call-to-action button takes. This can be an external URL or system console page.

**PR Requirement**
1. Include screenshots of the modals and/or screens of all target clients to provide visual representation of the changes made.
2. Provide clear and detailed test steps along with expected outcomes as per the PR template to ensure that the changes made can are tested before merging into the `release` branch.

### After opening a PR

1. Ensure that the "PM Review", "Editor Review", and "QA Review" labels are added to the issue. The recommended reviewers are the Product Manager and Technical Writer for the notice content, as well as the QA team member involved in the product feature that is being announced.
2. For QA review, see [QA criteria when reviewing a PR](#qa-criteria-when-reviewing-a-pr). Once reviews are complete the PR can be merged to the `release` branch.
3. Once merged, verify the changes have been mirrored to https://notices.mattermost.com/ (this may take up to 15 minutes post-merge).

Servers check for notices https://notices.mattermost.com/ once per hour, so it will take up to 1 hour for any newly merged notices to appear in the wild.

### QA criteria when reviewing a PR
1. Removal of Notices \
When a PR removes a notice, the following checks should be performed:
    - Verify that the notice and all related assets, such as images or forms, have been removed from the appropriate sources, such as image file or Google docs.
2. Addition of Notices \
When a PR adds a notice, the following checks should be performed:
   - Verify that a Jira ticket is provided, and that it matches the fix version for the release.
   - Ensure that notices modal based on provided screenshots are displayed correctly according to the target client (e.g., web, desktop, or mobile app).
   - Check that any URLs associated with the notice are reachable and functioning as expected.
   - Perform actual testing of the notice's functionality when the required environments (e.g., server release or RC build) are available.
   - If the required environments are not available, perform post-merge testing at the time of closing the corresponding Jira ticket.

### How to Test Notices via `/cloud` Plugin
1. Prepare `notices.json` and merge it into the `master` branch. For testing purposes, change some notice conditions, such as the `displayDate`, to mock and meet date conditions.
2. Check the server requirements and create a test server via `/cloud`. Typically, use a lower server version based on what is stated in the required version to establish a baseline for testing. Check that no notice pops up since newly created users are marked as read at the time of account creation.
3. Update the server configuration related to in-product notice, such as enabling or disabling for admins or users, depending on the notice condition at `System Console > Site Configuration > Notices`. Change the notice URL and fetch frequency by running:
  ```bash
  /cloud upgrade [server_name] --env MM_AnnouncementSettings_NoticesURL=https://notices.mattermost.com/pre-release/notices.json,MM_AnnouncementSettings_NoticesFetchFrequency=60
  ```
4. Access the server using the target client type and user audience and verify that the modal for the notice pops up as expected.
5. Verify that the content, image, link, and action are working as expected.

## FAQ

### Troubleshooting

#### Checks aren't passing on my PR

The PR checks have automated syntax checking to verify the syntax used for conditions.

#### Checks won't complete and stuck in a yellow state

Please check with the Release team in the Developers: DevOps channel.

#### When do notices pop-up for users?

If a user meets the conditions to show a notice the modal appears on first websocket connection of the day (similar to the Github plugin daily digest).

#### Do we have telemetry on individual notices?

Yes, we track impressions and clicks on the call-to-action button for every notice ([telemetry PR](https://github.com/mattermost/mattermost-webapp/pull/6934)).

#### Do notices interrupt the onboarding flow for newly created users if they meet the trigger conditions?

No. All existing notices are marked as read at the time of account creation so users will only see new notices that are added after their account creation date.  
