import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

/**
 *  TODO
 * - [ ] Add setting to limit the number of days to search for previous tasks (search 'TODO daysback')
 * - [ ] Add setting to allow user to specify the format of the date in the daily note (search 'TODO dateformat')
 * currently, we have it hardcoded to search in ISO format (YYYY-MM-DD), so would require some parsing
 * probably via a regex match statement or something like that
 * 
 */

interface UnfinishedBusinessPluginSettings {
	nameOfSection: string;
	sectionPrefix: string;
}

const DEFAULT_SETTINGS: UnfinishedBusinessPluginSettings = {
	nameOfSection: 'Tasks',
	sectionPrefix: '##',
}

export default class UnfinishedBusinessPlugin extends Plugin {
	settings: UnfinishedBusinessPluginSettings;

	async onload() {
		await this.loadSettings();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new UnfinishedBusinessPluginSettingsTab(this.app, this));
		 
		// once layout is loaded, listen for any new notes created
 		this.app.workspace.onLayoutReady(() => {
			this.app.vault.on('create', async (file: TFile) => {
				if (this.isTodayNote(file.basename)) {
					new Notice('Today note created - Generating Unfinished Business');
					// go find unfinished business in yesterday's daily note
					const previousTodoList = await this.getPreviousTodoList();
					// if it exists, copy it to today's note
					this.app.vault.append(file, previousTodoList)
				}
			})
		})
	}


	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	isTodayNote(date: string) {
		// take in date string and return true if it is today
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const noteDate = new Date(date);
		// handle timezone offset
		noteDate.setMinutes(noteDate.getMinutes() + noteDate.getTimezoneOffset());
		return today.toDateString() === noteDate.toDateString();
	}

	async getPreviousTodoList(): Promise<string> {
		// TODO dateformat this might be the place to add the match statement for the date format
		const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
		const dailyNotes = this.app.vault.getMarkdownFiles()
			.filter(file => dateFormatRegex.test(file.basename))
			.sort((a, b) => b.basename.localeCompare(a.basename));

		const dateToFindPrevious = new Date();
		let previousDateFound = null;
		let i = 0;

		// limit the search to previous 14 days for long vacation? 
		// TODO daysback make this into a setting for the user to change
		while (previousDateFound === null && i < 14) {
			dateToFindPrevious.setDate(dateToFindPrevious.getDate() - 1);
			// TODO dateformat utilize the date format setting here if implemented
			const dateToFindPreviousString = dateToFindPrevious.toISOString().split('T')[0];
			// even if the file doesn't have the section, maybe update this to look for files that have the section...
			previousDateFound = dailyNotes.find(note => note.basename === dateToFindPreviousString) ?? null;
			i++;
		}

		if (previousDateFound === null) {
			return this.settings.sectionPrefix + ' ' + this.settings.nameOfSection + '\nNo unfinished business found in previous notes';
		}

		const previousTodoList = await this.buildTodoList(previousDateFound);


		return previousTodoList;
	}

	async buildTodoList(previousDateFound: TFile): Promise<string> {
		let previousTodoList = '## Tasks\n';
		const taskSection = this.settings.sectionPrefix + " " + this.settings.nameOfSection;
		const previousNote = await this.app.vault.read(previousDateFound);
		const lines = previousNote.split('\n');
		let inTodoSection = false;

		for (const line of lines) {
			if (line.startsWith(taskSection)) {
				inTodoSection = true;
			} else if (inTodoSection && (line.startsWith('- [ ]') || line.startsWith('\t- [ ]'))) {
				previousTodoList += line + '\n';
			} else if (line === "" && inTodoSection) {
				inTodoSection = false;
			}
		}

		return previousTodoList;
	}
}

class UnfinishedBusinessPluginSettingsTab extends PluginSettingTab {
	plugin: UnfinishedBusinessPlugin;

	constructor(app: App,	plugin: UnfinishedBusinessPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Task Section Name')
			.setDesc('Set the name for the section where tasks are stored in the daily note.')
			.addText(text => text
				.setPlaceholder('Enter the name of the section')
				.setValue(this.plugin.settings.nameOfSection)
				.onChange(async (value) => {
					this.plugin.settings.nameOfSection = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Section Prefix')
			.setDesc('Set the prefix for the section where tasks are stored in the daily note. (ex. ## for a second level heading)')
			.addText(text => text
				.setPlaceholder('Enter the prefix of the section')
				.setValue(this.plugin.settings.sectionPrefix)
				.onChange(async (value) => {
					this.plugin.settings.sectionPrefix = value;
					await this.plugin.saveSettings();
				}));
	}
}
