import { Box, Divider, InputAdornment, List, ListItem, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';
import { objectList } from './objectlist';


function App(): JSX.Element {
    return <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
            InputProps={{ startAdornment: <InputAdornment position={'start'}><Search/></InputAdornment> }}
        />
        <List>
            {
                objectList.map((value, index) => {
                    return (
                        <>
                            <ListItem key={index}>
                                {JSON.stringify(value, null, 2)}
                            </ListItem>
                            <Divider/>
                        </>
                    )
                })
            }
        </List>

    </Box>
}

export default App;
