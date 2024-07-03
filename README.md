# Unfinished Business Plugin

The Unfinished Business plugin helps you manage your tasks and unfinished work within Obsidian. It provides a seamless integration with your notes and allows you to keep track of your pending tasks, ideas, and unfinished projects.


## Installation

1. Download the `unfinished-business` plugin source code. 
2. Copy the folder to your Obsidian plugins directory: `/path/to/your/obsidian/vault/.obsidian/plugins/unfinished-business`.
3. Run npm build
4. Open Obsidian and navigate to the "Community Plugins" section in the settings.
4. Enable the "Unfinished Business" plugin.

## Usage

1. Open a daily note and input a Tasks section. 
2. Use the following syntax to create a task:

  ```markdown
  ## Tasks (note, you can use any heading or style you want. Update the settings accordingly) (NO space between the header and the first task)
  - [ ] Task description
  ```

3. To mark a task as complete, change the checkbox to `[x]`:

  ```markdown
  - [x] Task description (or click it in reader mode)
  ```

4.  When you open up obsidian the next day, and create your daily note, it will automatically pull in the previously uncompleted tasks.

If there wasn't a daily note on the previous day, it will continue to go back in time until it finds a daily note and copy that task section over. If there is a daily note without a Task section, it will not pull any tasks over.

## Plugin Settings

Task Section Name (i.e. Tasks, TODOS, etc)
Section Prefix (typically a header `##` or really whatever `$`)