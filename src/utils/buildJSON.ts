import { PromptState } from '@/store/promptStore';

export interface JSONOutput {
    task: string;
    rules: string[];
    storyConfig: {
        genre: string;
        plot: string;
        specifics: string[];
    };
    moderation: {
        allowVulgar: boolean;
        allowCussing: boolean;
    };
    limits: {
        minWords: number;
        maxWords: number;
        maxChapters: number;
        uniqueness: number;
    };
}

export function buildJSON(state: PromptState): JSONOutput {
    return {
        task: state.mainTask,
        rules: state.rules,
        storyConfig: {
            genre: state.story.genre,
            plot: state.story.plot,
            specifics: state.story.specifics,
        },
        moderation: {
            allowVulgar: state.moderation.vulgar,
            allowCussing: state.moderation.cussing,
        },
        limits: {
            minWords: state.limits.minWords,
            maxWords: state.limits.maxWords,
            maxChapters: state.limits.chapters,
            uniqueness: state.limits.uniqueness,
        },
    };
}
