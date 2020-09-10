/** User role, i.e. who will see the notice. Defaults to "all"  */
export enum Audience {
    SysAdmin = "sysadmin",
    TeamAdmin = "teamadmin",
    Member = "member",
    All = "all",
}

/** SKU. Defaults to "all" */
export enum SKU {
    Team = "team",
    E0 = "e0",
    E10 = "e10",
    E20 = "e20",
    All = "all",
}

/** Instance type. Defaults to "both" */
export enum InstanceType {
    Cloud = "cloud",
    OnPrem = "onprem",
    Both = "both"
}

/** Client type. Defaults to "all" */
export enum ClientType {
    Desktop = "desktop",
    Web = "web",
    Mobile = "mobile",
    MobileAndroid = "mobile-android",
    MobileIOS = "mobile-ios",
    All = "all"
}
/** Possible actions to execute on button press */
export enum Action {
    URL = "url",
}


export type Conditions = {
    audience?: Audience;
    sku?: SKU;
    instanceType?: InstanceType;
    /** When to display the notice.
     * Examples:
     * "2020-03-01T00:00:00Z" - show on specified date
     * ">= 2020-03-01T00:00:00Z" - show after specified date
     * "< 2020-03-01T00:00:00Z" - show before the specified date
     * "> 2020-03-01T00:00:00Z <= 2020-04-01T00:00:00Z" - show only between the specified dates
     */
    displayDate?: string;
    /** 
     * What server versions does this notice apply to. 
     * Format: semver ranges (https://devhints.io/semver) 
     * Example: [">=1.2.3 < ~2.4.x"]
     * Example: ["<v5.19", "v5.20-v5.22"]
     */
    serverVersion?: string[];
    /** 
     * What mobile client versions does this notice apply to. 
     * Format: semver ranges (https://devhints.io/semver) 
     * Example: [">=1.2.3 < ~2.4.x"]
     * Example: ["<v5.19", "v5.20-v5.22"]
     */
    mobileVersion?: string[];
    /** 
     * What desktop client versions does this notice apply to. 
     * Format: semver ranges (https://devhints.io/semver) 
     * Example: [">=1.2.3 < ~2.4.x"]
     * Example: ["<v5.19", "v5.20-v5.22"]
     */
    desktopVersion?: string[];
    /** 
     * Map of mattermost server config paths and their values. Notice will be displayed only if the values match the target server config
     * Example: serverConfig: { "PluginSettings.Enable": true, "GuestAccountsSettings.Enable": false }  
     */
    serverConfig?: Record<string, any>;
    /** 
     * Map of user's settings and their values. Notice will be displayed only if the values match the viewing users' config
     * Example: userConfig: { "new_sidebar.disabled": true }  
     */
    userConfig?: Record<string, any>;
    /** Only show the notice when server has more than specified number of users */
    numberOfUsers?: number;
    /** Only show the notice when server has more than specified number of posts */
    numberOfPosts?: number;
    /** Only show the notice on specific clients. Defaults to 'all' */
    clientType?: ClientType;
};

export type Message = {
    /** Notice title. Use {{Mattermost}} instead of plain text to support white-labeling. Text supports Markdown. */
    title: string;
    /** Notice content. Use {{Mattermost}} instead of plain text to support white-labeling. Text supports Markdown. */
    description: string;
    image?: string;
    /** Optional override for the action button text (defaults to OK) */
    actionText?: string;
    /** Optional action to perform on action button click. (defaults to closing the notice) */
    action?: Action;
    /** Optional action parameter. 
     * Example: {"action": "url", actionParam: "/console/some-page"}
     */
    actionParam?: string;
}

export type ProductNotice = {
    /** Unique identifier for this notice. Can be a running number. Used for storing 'viewed' state on the server. */
    id: string;

    conditions: Conditions;
    /** Notice message data, organized by locale.
     * Example: 
     * "localizedMessages": { 
     *  "en-US": { "title": "English", description: "English description"},
     *  "fr-FR": { "title": "Frances", description: "French description"}
     * }
     */
    localizedMessages: Record<string, Message>;
    /**  Configurable flag if the notice should reappear after it’s seen and dismissed */
    repeatable?: boolean;
}

/** List of product notices. Order is important and is used to resolve priorities.
 * Each notice will only be show if conditions are met.
 */
export type ProductNotices = ProductNotice[];