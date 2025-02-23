import { CredentialsType } from '@/convex/types';
import { useReducer, useCallback } from 'react';

export type CredentialsSortOption = 'name' | 'createdAtAsc' | 'createdAtDesc' | 'updatedAt';
export type CredentialsDialogType = 'create' | 'request';

export interface CredentialsState {
    filters: {
        searchTerm: string;
        sortOption: CredentialsSortOption;
        selectedTypes: CredentialsType[];
        hideExpired: boolean;
    };
    currentPage: number;
    isCreateDialogOpen: boolean;
    isRequestDialogOpen: boolean;
}

type CredentialsAction = 
    | { type: 'SET_FILTERS'; payload: Partial<CredentialsState['filters']> }
    | { type: 'SET_CURRENT_PAGE'; payload: number }
    | { type: 'SET_DIALOG_OPEN'; payload: { dialog: 'create' | 'request'; isOpen: boolean } };

function credentialsReducer(state: CredentialsState, action: CredentialsAction): CredentialsState {
    switch (action.type) {
        case 'SET_FILTERS':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload,
                },
            };
        case 'SET_CURRENT_PAGE':
            return {
                ...state,
                currentPage: action.payload,
            };
        case 'SET_DIALOG_OPEN':
            return {
                ...state,
                isCreateDialogOpen: action.payload.dialog === 'create' ? action.payload.isOpen : state.isCreateDialogOpen,
                isRequestDialogOpen: action.payload.dialog === 'request' ? action.payload.isOpen : state.isRequestDialogOpen,
            };
        default:
            return state;
    }
}

export function useCredentialsManagement() {
    const [state, dispatch] = useReducer(credentialsReducer, {
        filters: {
            searchTerm: '',
            sortOption: 'name',
            selectedTypes: [],
            hideExpired: false,
        },
        currentPage: 1,
        isCreateDialogOpen: false,
        isRequestDialogOpen: false,
    });

    const setFilters = useCallback((payload: Partial<CredentialsState['filters']>) => {
        dispatch({ type: 'SET_FILTERS', payload });
    }, []);

    const setCurrentPage = useCallback((page: number) => {
        dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    }, []);

    const setDialogOpen = useCallback((dialog: 'create' | 'request', isOpen: boolean) => {
        dispatch({ type: 'SET_DIALOG_OPEN', payload: { dialog, isOpen } });
    }, []);

    return {
        state,
        actions: {
            setFilters,
            setCurrentPage,
            setDialogOpen,
        },
    };
}
