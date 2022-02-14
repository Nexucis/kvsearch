import {
    Box,
    Chip,
    InputAdornment,
    Paper,
    Switch,
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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { KVSearch } from '@nexucis/kvsearch';
import { KVSearchExtension, translate } from '@nexucis/kvsearch-codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';

const kvSearch = new KVSearch<Target>({
    shouldSort: true,
    pre: '<strong>',
    post: '</strong>',
    indexedKeys: [
        'labels',
        'scrapePool',
        ['labels', /.*/]
    ]
})

interface searchProps {
    onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

interface expertSearchProps {
    onChange: (update: ViewUpdate) => void;
}

function BasicSearch(props: searchProps): JSX.Element {
    return (
        <TextField sx={{ marginLeft: '25%', marginRight: '25%' }}
                   onChange={props.onChange}
                   InputProps={{ startAdornment: <InputAdornment position={'start'}><Search/></InputAdornment> }}
        />
    )
}

function ExpertSearch(props: expertSearchProps): JSX.Element {
    const kvSearchExtension = new KVSearchExtension(objectList);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    useEffect(() => {
        if (!containerRef.current) {
            throw new Error('expected CodeMirror container element to exist');
        }
        if (viewRef.current === null) {
            viewRef.current = new EditorView({
                state: EditorState.create({
                    extensions: [basicSetup, kvSearchExtension.asExtension(), EditorView.updateListener.of(props.onChange)],
                    doc: ''
                }),
                parent: containerRef.current,
            })
        }

    })

    return (
        <div ref={containerRef}/>
    )
}

function App(): JSX.Element {
    const initialPoolList = groupTargets(objectList)
    const [list, setList] = useState<Record<string, Target[]>>(initialPoolList)
    const [searchMode, setSearchMode] = useState(true);

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

    const handleExpertSearchChange = (update: ViewUpdate): void => {
        if (update.docChanged)
            if (update.state.doc.toString() != '') {
                const query = translate(update.state)
                if (query !== null) {
                    const result = kvSearch.filterWithQuery(query, objectList)
                    setList(groupTargets(result.map((value) => {
                        return value.original as unknown as Target
                    })));
                }
            } else {
                setList(initialPoolList)
            }

    }

    const handleSearchModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchMode(event.target.checked);
    };

    return <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Switch checked={searchMode} onChange={handleSearchModeChange}/>
        {searchMode ?
            <BasicSearch onChange={handleSearchChange}/> : <ExpertSearch onChange={handleExpertSearchChange}/>
        }
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
