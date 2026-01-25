import axios from "axios";
import type { orderObj } from "./orderObj";

// Type for editing an order (no paid field)
export type EditableOrderObj = Omit<orderObj, 'paid'>;
import menuData from '../menu/menuData.json' assert {type: "json"};


//get all the orders
export async function getOrders():Promise<orderObj[]> {
    const res = (await axios.get('/api/db/order/getOrders')).data;
    return res;
};

//get a specific order by username
export async function getOrder(username: string): Promise<orderObj | null> {
    try {
        const res = (await axios.get(`/api/db/order/getOrder/${encodeURIComponent(username)}`)).data;
        return res;
    } 
    catch (err: any) {
        if (err.response && err.response.status === 404) {

            //username not found
            return null;
        }
        throw err; // Other errors
    };
};

//place a new order
export async function placeOrder(data: { username: string; cost: number; toasties: string[]; drinks: string[]; deserts: string[] }):Promise<orderObj> {

    //the user cannot make orders between 13:00 and 21:59 on a Sunday.
    const DISABLE_TIMECHECK = import.meta.env.VITE_DISABLE_ORDERS_TIMECHECK;
    const currentTime: Date = new Date();
    if (DISABLE_TIMECHECK == 'false' && currentTime.getDay() === 0 && currentTime.getHours() >= 14 && currentTime.getHours() < 22) {

        //invalid time to make an order
        throw new Error("Orders cannot be placed between 1:00 PM and 9:59 PM on Sundays.");
    }
    else {

        //valid time to place an order, do so
        const { cost, toasties, drinks, deserts } = data;
        const res = (await axios.post(`/api/db/order/createNewOrder/${encodeURIComponent(data.username)}`, { cost, toasties, drinks, deserts })).data;
        return res;
    };
};

//delete an order based on username
export async function deleteOrder(username: string):Promise<string> {
    const res = await axios.delete(`/api/db/order/deleteOrder/${encodeURIComponent(username)}`);
    if (res.status === 200) {
        return '';
    }
    else {
        return res.data.error;
    };
};

//edit an order based on username
export async function editOrder(
    data: { username: string; cost: number; toasties: string[]; drinks: string[]; deserts: string[] }
): Promise<orderObj> {
    const {username, cost, toasties, drinks, deserts} = data;
    const res = (await axios.put(`/api/db/order/editOrder/${encodeURIComponent(username)}`, {cost, toasties, drinks, deserts})).data;
    return res;
};

//get the cost of an order
export function extractCost(form: HTMLFormElement, setErrorMsg: Function): number {
    const main = (form.elements.namedItem('toggleMainCourse') as HTMLInputElement)?.checked;
    const drink = (form.elements.namedItem('toggleDrinks') as HTMLInputElement)?.checked;
    const desert = (form.elements.namedItem('toggleDesert') as HTMLInputElement)?.checked;

    if (!main && !drink && !desert) {
        setErrorMsg('You must select at least one of a main, drink, or desert.');
        return -1;
    }

    let cost = 0;
    const numToasties = main ? countSections(form, 'toasty', menuData.mainCourse.extras) : 0;
    const numDrinks = drink ? countSections(form, 'drink', menuData.drinks.extras) : 0;
    const numDeserts = desert ? countSections(form, 'desert', menuData.desert.extras) : 0;

    for (let i = 0; i < numToasties; i++) {
        cost += Number(menuData.mainCourse.base.baseCost);
        cost += sumExtras(form, menuData.mainCourse.extras, `_toasty_${i}`);
    }
    for (let i = 0; i < numDrinks; i++) {
        cost += Number(menuData.drinks.base.baseCost) > 0 ? Number(menuData.drinks.base.baseCost) : 0;
        cost += sumExtras(form, menuData.drinks.extras, `_drink_${i}`);
    }
    for (let i = 0; i < numDeserts; i++) {
        cost += Number(menuData.desert.base.baseCost);
        cost += sumExtras(form, menuData.desert.extras, `_desert_${i}`);
    }
    cost = Math.round(cost * 100) / 100;
    return cost;
}

//mark an order as paid
export async function payOrder(username: string):Promise<orderObj> {
    const res = (await axios.put(`/api/db/order/payOrder/${encodeURIComponent(username)}`)).data;
    return res;
};

//get the items from an order
export function extractOrderItems(form: HTMLFormElement): { toasties: string[], drinks: string[], deserts: string[] } {
    const toasties = getCheckedItemsWithMarker(form, 'toasty', 'NEW TOASTY');
    const drinks = getCheckedItems(form, 'drink');
    const deserts = getCheckedItemsWithMarker(form, 'desert', 'NEW DESERT');
    return { toasties, drinks, deserts };
};


//helpers
// Names are formatted as {itemName}_{section}_{index}, e.g. Cheese_toasty_0
function getCheckedItems(form: HTMLFormElement, section: string): string[] {
    const items: string[] = [];
    const elements = form.querySelectorAll(`[name*="_${section}_"]`);
    elements.forEach(el => {
        const input = el as HTMLInputElement;
        if (input.checked) {
            // Extract the item name (everything before _section_index)
            const name = input.name;
            const match = name.match(new RegExp(`^(.+)_${section}_\\d+$`));
            if (match) {
                items.push(match[1]);
            }
        }
    });
    return items;
};

// For toasties and deserts, group by index and add a marker before each group
function getCheckedItemsWithMarker(form: HTMLFormElement, section: string, marker: string): string[] {
    const itemsByIndex: Map<number, string[]> = new Map();
    // Find all possible indices by looking for inputs with names matching _section_index
    const allInputs = form.querySelectorAll(`[name*="_${section}_"]`);
    const indices = new Set<number>();
    allInputs.forEach(el => {
        const input = el as HTMLInputElement;
        const match = input.name.match(new RegExp(`^(.+)_${section}_(\\d+)$`));
        if (match) {
            const index = parseInt(match[2], 10);
            indices.add(index);
        }
    });

    // Collect checked extras for each index
    allInputs.forEach(el => {
        const input = el as HTMLInputElement;
        if (input.checked) {
            const match = input.name.match(new RegExp(`^(.+)_${section}_(\\d+)$`));
            if (match) {
                const itemName = match[1];
                const index = parseInt(match[2], 10);
                if (!itemsByIndex.has(index)) {
                    itemsByIndex.set(index, []);
                }
                itemsByIndex.get(index)!.push(itemName);
            }
        }
    });

    // Build result array with markers, always add marker for each detected index
    const result: string[] = [];
    const sortedIndices = Array.from(indices).sort((a, b) => a - b);
    for (const idx of sortedIndices) {
        result.push(marker);
        if (itemsByIndex.has(idx)) {
            result.push(...itemsByIndex.get(idx)!);
        }
    }
    return result;
};

function countSections(form: HTMLFormElement, prefix: string, extras: { name: string, cost: number }[]): number {
    let count = 0;
    while (true) {
        const testName = extras[0]?.name + `_${prefix}_${count}`;
        const el = form.elements.namedItem(testName);
        if (el) {
            count++;
        } else {
            break;
        }
    }
    return count === 0 ? 1 : count;
};

function sumExtras(form: HTMLFormElement, extras: { name: string, cost: number }[], suffix: string): number {
    let sum = 0;
    extras.forEach(extra => {
        const checkbox = form.elements.namedItem(extra.name + suffix) as HTMLInputElement;
        if (checkbox && checkbox.checked) {
            sum += extra.cost;
        }
    });
    return sum;
};