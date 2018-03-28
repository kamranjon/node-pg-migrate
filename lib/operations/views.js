import { template, quote, escapeValue } from "../utils";

export const drop = (viewName, { ifExists, cascade } = {}) =>
  template`DROP VIEW${ifExists ? " IF EXISTS" : ""} "${viewName}"${
    cascade ? " CASCADE" : ""
  };`;

export const create = (viewName, options, definition) => {
  const { temporary, replace, recursive, columns = [], checkOption } = options;
  const columnNames = quote(Array.isArray(columns) ? columns : [columns]).join(
    ", "
  );

  return template`CREATE${replace ? " OR REPLACE" : ""}${
    temporary ? " TEMPORARY" : ""
  }${recursive ? " RECURSIVE" : ""} VIEW "${viewName}"${
    columnNames ? `(${columnNames})` : ""
  } AS ${definition}${checkOption ? ` WITH ${checkOption} CHECK OPTION` : ""};`;
};

export const alter = (viewName, options) => {
  const { checkOption } = options;
  const clauses = [];
  if (checkOption !== undefined) {
    if (checkOption) {
      clauses.push(`SET check_option = ${checkOption}`);
    } else {
      clauses.push(`RESET check_option`);
    }
  }
  return clauses
    .map(clause => template`ALTER VIEW "${viewName}" ${clause};`)
    .join("\n");
};

export const alterColumn = (viewName, columnName, options) => {
  const { default: defaultValue } = options;
  const actions = [];
  if (defaultValue === null) {
    actions.push("DROP DEFAULT");
  } else if (defaultValue !== undefined) {
    actions.push(`SET DEFAULT ${escapeValue(defaultValue)}`);
  }
  return actions
    .map(
      action =>
        template`ALTER VIEW "${viewName}" ALTER COLUMN ${columnName} ${action};`
    )
    .join("\n");
};

// RENAME
export const rename = (viewName, newViewName) =>
  template`ALTER VIEW "${viewName}" RENAME TO "${newViewName}";`;

export const undoRename = (viewName, newViewName) =>
  rename(newViewName, viewName);

create.reverse = drop;
rename.reverse = undoRename;