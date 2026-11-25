import * as React from 'react';

// True while a pull-to-refresh the patient started is running. The page header shows the spinner under its description.
export const RefreshContext = React.createContext(false);
