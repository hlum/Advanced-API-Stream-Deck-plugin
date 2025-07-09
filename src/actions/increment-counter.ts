import streamDeck, {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  Text,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { JSONPath } from "jsonpath-plus";
/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.hlwan-aung-phyo.advanced-api.increment" })
export class IncrementCounter extends SingletonAction<APISetting> {
  /**
   * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
   * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
   * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
   */
  override onWillAppear(ev: WillAppearEvent<APISetting>): void | Promise<void> {
    const { settings } = ev.payload;
    return ev.action.setTitle(settings.jsonpath ?? "Hello, World!");
    // return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
    // return ev.action.setTitle(`Hello, World!`);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<APISetting>
  ): Promise<void> | void {
    const { settings } = ev.payload;
    // Update the title with the current count from the settings.
    return ev.action.setTitle(settings.jsonpath ?? "Hello, World!");
    // return ev.action.setTitle(`${settings.count ?? 0}`);
    // return ev.action.setTitle(`Hello, World!`);
  }

  /**
   * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
   * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
   * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
   * settings using `setSettings` and `getSettings`.
   */
  override async onKeyDown(ev: KeyDownEvent<APISetting>): Promise<void> {
    const result = await this.fetchUser("$.name");
    ev.action.setTitle(result);
  }

  async fetchUser(path: string): Promise<string> {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/1`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      streamDeck.logger.trace(`Fetched JSON: ${JSON.stringify(data)}`);

      const value = JSONPath({ path: path, json: data as any });
      streamDeck.logger.trace(
        `Fetched value from JSONPath: ${JSON.stringify(value)}`
      );

      // JSONPath returns an array, so we need to handle it properly
      let result: string;
      if (Array.isArray(value) && value.length > 0) {
        result = String(value[0]); // Get first result and convert to string
      } else if (value !== undefined && value !== null) {
        result = String(value);
      } else {
        result = ""; // Return empty string if no value found
      }

      streamDeck.logger.info(`Fetched value: ${result}`);
      return result;
    } catch (error) {
      streamDeck.logger.error("Error fetching user:", error);
      throw error;
    }
    if (true) {
}
  }
}

/**
 * Settings for {@link IncrementCounter}.
 */
type APISetting = {
  method: string;
  url: string;
  jsonpath: string;
};
