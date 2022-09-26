import { addDoc, deleteDoc, doc, getDocs, query, serverTimestamp } from "firebase/firestore";
import { useEvents } from "hooks/useEvents";
import { db, questCollection } from "./config";
import { getData } from "./utils";

const { setQuests } = useEvents.getState();

export const updateQuests = async () => {
    await deleteOldQuests();

    const quests = getData(
        await getDocs(query(questCollection))
    );

    setQuests(quests.map((item: any) => item as Quest));
}

export const createQuest = async (data: Quest) => {
    await addDoc(questCollection, { ...data, createdTime: serverTimestamp() });
    await updateQuests();
}

export const deleteQuest = async (id: any) => {
    await deleteDoc(doc(db, "quests", id));
}

const deleteOldQuests = async () => {
    const quests = getData(
        await getDocs(query(questCollection))
    ).map((item: any) => item as Quest);

    for(const quest of quests) {
        const deadline = new Date(quest?.deadline);
        if (deadline < new Date()) {
            await deleteQuest(quest._id);
        }
    }
}