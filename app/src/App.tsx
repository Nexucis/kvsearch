import { Box, Divider, InputAdornment, List, ListItem, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';
import { objectList } from './objectlist';
import { KVSearch } from '@nexucis/kvsearch';
import { ChangeEvent, useState } from 'react';

const kvSearch = new KVSearch({
    shouldSort: true,
    indexedKeys: [
        'labels',
        'scrapePool',
        ['labels', /.*/]
    ]
})

function App(): JSX.Element {
    const [list, setList] = useState<Record<string, unknown>[]>(objectList)
    const handleSearchChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.target.value !== '') {
            const result = kvSearch.filter(e.target.value, objectList)
            setList(result.map((value) => {
                return value.original
            }))
        }
    }

    return <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
            onChange={handleSearchChange}
            InputProps={{ startAdornment: <InputAdornment position={'start'}><Search/></InputAdornment> }}
        />
        <List>
            {
                list.map((value, index) => {
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
