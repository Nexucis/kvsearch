import {
    Box,
    Chip,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { groupTargets, objectList, Target } from './objectlist';
import { ChangeEvent, useState } from 'react';
import { KVSearch } from '@nexucis/kvsearch';

const kvSearch = new KVSearch({
    shouldSort: true,
    pre: '<strong>',
    post: '</strong>',
    indexedKeys: [
        'labels',
        'scrapePool',
        ['labels', /.*/]
    ]
})

function App(): JSX.Element {
    const initialPoolList = groupTargets(objectList)
    const [list, setList] = useState<Record<string, Target[]>>(initialPoolList)
    const handleSearchChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.target.value !== '') {
            const result = kvSearch.filter(e.target.value.trim(), objectList)
            setList(groupTargets(result.map((value) => {
                return value.original as unknown as Target
            })));
        } else {
            setList(initialPoolList)
        }
    }

    return <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <TextField sx={{ marginLeft: '25%', marginRight: '25%' }}
                   onChange={handleSearchChange}
                   InputProps={{ startAdornment: <InputAdornment position={'start'}><Search/></InputAdornment> }}
        />
        {
            Object.entries(list).map(([scrapePool, targets], index) => {
                return <Box key={index} sx={{ marginLeft: '2rem', marginRight: '2rem' }}>
                    <Typography variant="h6">
                        {scrapePool}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Endpoint</TableCell>
                                    <TableCell align={'right'}>State</TableCell>
                                    <TableCell align={'right'}>Labels</TableCell>
                                    <TableCell align={'right'}>Last Scrape</TableCell>
                                    <TableCell align={'right'}>Scrape Duration</TableCell>
                                    <TableCell align={'right'}>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    targets.map((target, targetIndex) => {
                                        return <TableRow
                                            key={`${index}/${targetIndex}`}
                                        >
                                            <TableCell>{target.scrapeUrl}</TableCell>
                                            <TableCell align={'right'}>{target.health}</TableCell>
                                            <TableCell align={'right'}>{
                                                Object.entries(target.labels).map(([labelKey, labelValue], labelIndex) => {
                                                    return <Chip key={`${index}/${targetIndex}/${labelIndex}`}
                                                                 label={`${labelKey}=${labelValue}`}/>
                                                })
                                            }</TableCell>
                                            <TableCell align={'right'}>{target.lastScrape}</TableCell>
                                            <TableCell align={'right'}>{target.lastScrapeDuration}</TableCell>
                                            <TableCell align={'right'}>{target.lastError}</TableCell>
                                        </TableRow>
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            })
        }
    </Box>
}

export default App;
